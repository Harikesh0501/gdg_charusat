import pytest
from fastapi.testclient import TestClient
from app.main import app


from app.core.db import SessionLocal


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def db():
    session = SessionLocal()
    session.begin_nested()
    try:
        yield session
    finally:
        session.rollback()
        session.close()

