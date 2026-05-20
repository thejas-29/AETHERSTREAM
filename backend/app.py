from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import jwt
import datetime
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
import random

app = Flask(__name__)
# Enable CORS for the React SPA, permitting credential headers and Authorization tokens
CORS(app)

# Configuration
app.config['SECRET_KEY'] = 'super-secret-aetherstream-key-change-in-prod'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///aetherstream.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- Database Models ---

class User(db.Model):
    """
    User Model representing authenticated portal operators.
    Carries role attribute for role-based authorization controls (Viewer, Manager, Admin).
    """
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='Viewer')  # Roles: Viewer, Manager, Admin

    transactions = db.relationship('Transaction', backref='owner', lazy=True, cascade="all, delete-orphan")


class Transaction(db.Model):
    """
    Transaction Model representing historical business sales events.
    Linked to users to track operational ownership and responsibility.
    """
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.datetime.utcnow)


# Initialize Relational Database Schema within App Context
with app.app_context():
    db.create_all()


# --- Custom Middlewares (JWT & RBAC Authentication) ---

def token_required(f):
    """
    Decorator to extract and validate stateless JSON Web Tokens from Authorization header.
    Injects the verified user object into the protected endpoint handler.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Extract Bearer token from HTTP Authorization header
        auth_header = request.headers.get('Authorization', None)
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

        if not token:
            return jsonify({'message': 'Access token is missing!'}), 401

        try:
            # Decode the token matching the HS256 sign signature
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = db.session.get(User, data['user_id'])
            if not current_user:
                return jsonify({'message': 'User record not found.'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Access token has expired. Please authenticate again.'}), 401
        except jwt.InvalidTokenError as e:
            return jsonify({'message': 'Invalid access token.', 'error': str(e)}), 401
        except Exception as e:
            return jsonify({'message': 'Authentication failed.', 'error': str(e)}), 401

        return f(current_user, *args, **kwargs)
    return decorated


def role_required(allowed_roles):
    """
    RBAC authorization decorator. Validates that the active user possesses
    a role corresponding to the allowed criteria.
    """
    def decorator(f):
        @wraps(f)
        def decorated(current_user, *args, **kwargs):
            if current_user.role not in allowed_roles:
                return jsonify({
                    'message': f'Access Forbidden: Requires one of these roles: {allowed_roles}. Current role: {current_user.role}'
                }), 403
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator


# --- Authentication & Registration Handlers ---

@app.route('/api/register', methods=['POST'])
def register():
    """
    Endpoint: Sign up a new user account.
    Validates input payloads, checks for pre-existing operators, and commits to database.
    """
    try:
        data = request.get_json()
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'message': 'Invalid payload. Missing username or password.'}), 400

        # Enforce unique username constraint
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'message': 'Username is already taken.'}), 400

        # Password hash using secure PBKDF2 algorithm
        hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')
        
        # Enforce restricted roles or fallback to 'Viewer'
        requested_role = data.get('role', 'Viewer')
        if requested_role not in ['Viewer', 'Manager', 'Admin']:
            requested_role = 'Viewer'

        new_user = User(
            username=data['username'],
            password_hash=hashed_password,
            role=requested_role
        )
        
        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            'message': 'Account registered successfully!',
            'user': {
                'username': new_user.username,
                'role': new_user.role
            }
        }), 201
    except Exception as e:
        return jsonify({'message': 'Registration error.', 'error': str(e)}), 500


@app.route('/api/login', methods=['POST'])
def login():
    """
    Endpoint: Authenticate user operators.
    Matches credentials and issues stateless expiration-protected JWT tokens.
    """
    try:
        data = request.get_json()
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'message': 'Missing credentials.'}), 400

        user = User.query.filter_by(username=data['username']).first()

        if not user or not check_password_hash(user.password_hash, data['password']):
            return jsonify({'message': 'Invalid credentials. Access Denied.'}), 401

        # Sign JWT claims with user ID and 24-hour expiration threshold
        payload = {
            'user_id': user.id,
            'role': user.role,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }
        token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm="HS256")

        return jsonify({
            'token': token,
            'user': {
                'username': user.username,
                'role': user.role
            }
        }), 200
    except Exception as e:
        return jsonify({'message': 'Login server error.', 'error': str(e)}), 500


# --- Analytical BI Endpoints ---

@app.route('/api/metrics', methods=['GET'])
@token_required
def get_metrics(current_user):
    """
    Endpoint: Extract core historical metrics and analytical aggregation sets.
    Computes Gross Inflow, Invoice Logs, Ticket Mean Weight, and Unique Accounts.
    Includes Category shares breakdown and chronological historical records.
    """
    try:
        # Base Historical KPI Calculations
        total_inflow = db.session.query(db.func.sum(Transaction.amount)).scalar() or 0.0
        invoice_count = db.session.query(db.func.count(Transaction.id)).scalar() or 0
        ticket_mean = db.session.query(db.func.avg(Transaction.amount)).scalar() or 0.0
        unique_accounts = db.session.query(db.func.count(db.func.distinct(Transaction.user_id))).scalar() or 0

        # Category Shares Distribution Breakdown
        category_query = db.session.query(
            Transaction.category,
            db.func.sum(Transaction.amount).label('total_amount'),
            db.func.count(Transaction.id).label('invoice_count')
        ).group_by(Transaction.category).all()

        category_shares = []
        for cat_name, amt, cnt in category_query:
            pct = (amt / total_inflow * 100) if total_inflow > 0 else 0
            category_shares.append({
                'category': cat_name,
                'total_amount': round(amt, 2),
                'invoice_count': cnt,
                'percentage': round(pct, 2)
            })

        # Fetch chronological transaction history (ordered by date) for logs and graphs
        history_txs = Transaction.query.order_by(Transaction.date.desc()).all()
        transactions_data = []
        for tx in history_txs:
            transactions_data.append({
                'id': tx.id,
                'amount': round(tx.amount, 2),
                'category': tx.category,
                'date': tx.date.isoformat(),
                'owner': tx.owner.username if tx.owner else 'System'
            })

        # Group and aggregate volume chronologically by day for visualization
        df_group = pd.DataFrame([{
            'date': tx.date.strftime('%Y-%m-%d'),
            'amount': tx.amount
        } for tx in history_txs])

        chronological_timeline = []
        if not df_group.empty:
            timeline_agg = df_group.groupby('date')['amount'].sum().reset_index()
            timeline_agg = timeline_agg.sort_values(by='date', ascending=True)
            for _, row in timeline_agg.iterrows():
                chronological_timeline.append({
                    'date': row['date'],
                    'amount': round(row['amount'], 2)
                })

        return jsonify({
            'gross_inflow': round(total_inflow, 2),
            'invoice_logs': invoice_count,
            'ticket_mean': round(ticket_mean, 2),
            'unique_accounts': unique_accounts,
            'category_shares': category_shares,
            'recent_transactions': transactions_data[:15], # limit list view to recent 15
            'chronological_timeline': chronological_timeline
        }), 200
    except Exception as e:
        return jsonify({'message': 'Error retrieving metrics dashboard data.', 'error': str(e)}), 500


@app.route('/api/forecast', methods=['GET'])
@token_required
def get_forecast(current_user):
    """
    Endpoint: Predictive machine learning engine.
    Runs OLS linear regression against database aggregates, outputting a 30-Day sales forecast.
    """
    try:
        transactions = Transaction.query.order_by(Transaction.date.asc()).all()
        
        # Guard clause: Require minimum transactional data to train the OLS pipeline
        if len(transactions) < 5:
            return jsonify({
                'message': 'Insufficient baseline transaction records to compute reliable predictive models.',
                'forecast_next_month': 0.0,
                'model_score': 0.0,
                'data_points': len(transactions)
            }), 200

        # Transform database transactions to Pandas DataFrame
        df = pd.DataFrame([{
            'date': tx.date.date(),
            'amount': tx.amount
        } for tx in transactions])

        # Aggregate transaction volumes daily
        daily_sales = df.groupby('date')['amount'].sum().reset_index()
        daily_sales['date_obj'] = pd.to_datetime(daily_sales['date'])
        start_date = daily_sales['date_obj'].min()
        daily_sales['days'] = (daily_sales['date_obj'] - start_date).dt.days

        X = daily_sales[['days']].values
        y = daily_sales['amount'].values

        # Build and fit the linear regression estimator
        model = LinearRegression()
        model.fit(X, y)

        # Extrapolate linear slope across the next 30 calendar days
        last_day = daily_sales['days'].max()
        future_days = np.arange(last_day + 1, last_day + 31).reshape(-1, 1)
        predictions = model.predict(future_days)
        
        # Enforce non-negative bounds
        predictions = np.maximum(predictions, 0)
        forecast_next_month = float(np.sum(predictions))

        # Calculate R² coefficient of determination score safely
        try:
            score = float(model.score(X, y))
        except:
            score = 0.0

        return jsonify({
            'forecast_next_month': round(forecast_next_month, 2),
            'model_score': round(score, 4),
            'data_points': len(X)
        }), 200

    except Exception as e:
        return jsonify({'message': 'Analytics predictive failure.', 'error': str(e)}), 500


# --- Admin Database Seeding & Transaction CRUD Operations ---

@app.route('/api/system/seed', methods=['POST'])
def seed_data():
    """
    Endpoint: Automated mock transaction seeding engine.
    Ensures safe populating of tables if empty.
    Creates default admin credentials (admin / admin123) if no user accounts exist.
    """
    try:
        # Step 1: Create a default admin user if database is completely empty
        default_user = None
        user_created = False
        if User.query.count() == 0:
            hashed = generate_password_hash('admin123', method='pbkdf2:sha256')
            default_user = User(username='admin', password_hash=hashed, role='Admin')
            db.session.add(default_user)
            db.session.commit()
            user_created = True
        else:
            default_user = User.query.filter_by(role='Admin').first()
            if not default_user:
                default_user = User.query.first()

        # Step 2: Seed transaction logs if empty
        if Transaction.query.count() == 0:
            categories = ['Software', 'Hardware', 'Consulting', 'Support']
            today = datetime.datetime.utcnow()
            
            # Generate 45 realistic operational transactions
            for i in range(45):
                # Distribute transactions across the last 30 days chronologically
                days_ago = random.randint(0, 30)
                date = today - datetime.timedelta(days=days_ago)
                
                tx = Transaction(
                    user_id=default_user.id,
                    amount=round(random.uniform(40.0, 1500.0), 2),
                    category=random.choice(categories),
                    date=date
                )
                db.session.add(tx)
            
            db.session.commit()
            msg = 'Database seeded successfully with 45 relational transaction logs.'
            if user_created:
                msg += ' Default admin account created: (username: admin / password: admin123)'
            return jsonify({'message': msg}), 201

        return jsonify({'message': 'Seed operation skipped: Relational database already contains transactional records.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Data seeding pipeline failure.', 'error': str(e)}), 500


@app.route('/api/transactions', methods=['POST'])
@token_required
@role_required(['Admin', 'Manager'])
def add_transaction(current_user):
    """
    Endpoint: Add a new transaction record (RBAC restricted to Admin & Manager).
    """
    try:
        data = request.get_json()
        if not data or not data.get('amount') or not data.get('category'):
            return jsonify({'message': 'Missing transaction amount or category.'}), 400

        try:
            amount = float(data['amount'])
            if amount <= 0:
                raise ValueError()
        except ValueError:
            return jsonify({'message': 'Amount must be a positive number.'}), 400

        # Optional date, fallback to UTC now
        date_val = datetime.datetime.utcnow()
        if data.get('date'):
            try:
                date_val = datetime.datetime.fromisoformat(data['date'].replace('Z', ''))
            except:
                pass

        new_tx = Transaction(
            user_id=current_user.id,
            amount=amount,
            category=data['category'],
            date=date_val
        )
        db.session.add(new_tx)
        db.session.commit()

        return jsonify({
            'message': 'Transaction added successfully.',
            'transaction': {
                'id': new_tx.id,
                'amount': new_tx.amount,
                'category': new_tx.category,
                'date': new_tx.date.isoformat(),
                'owner': current_user.username
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to create transaction.', 'error': str(e)}), 500


@app.route('/api/transactions/<int:tx_id>', methods=['DELETE'])
@token_required
@role_required(['Admin'])
def delete_transaction(current_user, tx_id):
    """
    Endpoint: Delete a transaction record (RBAC restricted strictly to Admin).
    """
    try:
        tx = db.session.get(Transaction, tx_id)
        if not tx:
            return jsonify({'message': 'Transaction record not found.'}), 404

        db.session.delete(tx)
        db.session.commit()

        return jsonify({'message': 'Transaction deleted successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to delete transaction.', 'error': str(e)}), 500


if __name__ == '__main__':
    # Run the Flask app on port 5000, enabling debug mode for local development
    app.run(host='0.0.0.0', port=5000, debug=True)
