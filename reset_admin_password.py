#!/usr/bin/env python3
"""
Script para garantir que o admin tem a senha correta.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'backend'))

from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

def reset_admin_password():
    db = SessionLocal()
    try:
        email = 'admin@academiaevoque.com.br'
        password = '12345678'
        
        admin = db.query(User).filter(User.email == email).first()
        
        if not admin:
            print(f"❌ Admin com email {email} não encontrado!")
            return False
        
        # Atualiza a senha
        admin.password_hash = get_password_hash(password)
        db.commit()
        db.refresh(admin)
        
        print("✅ SUCESSO!")
        print(f"Email  : {admin.email}")
        print(f"Senha  : {password}")
        print()
        print("Agora você pode fazer login no frontend com essas credenciais.")
        return True
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False
    finally:
        db.close()

if __name__ == '__main__':
    success = reset_admin_password()
    sys.exit(0 if success else 1)
