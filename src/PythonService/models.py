from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from sqlalchemy.ext.declarative import declarative_base

metadata = MetaData()
Base = declarative_base(metadata=metadata)
db = SQLAlchemy(metadata=metadata)

class Store(db.Model):
    __tablename__ = "Store"
    productId = db.Column(db.Integer, primary_key=True)
    availability = db.Column(db.Integer, nullable=False)
    def __repr__(self):
        return '<ProductStore %r>' % self.productId