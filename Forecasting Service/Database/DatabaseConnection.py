from sqlalchemy import create_engine

engine = create_engine( "postgresql://postgres:Kumaravellan_12@localhost:5432/Test", pool_pre_ping=True )