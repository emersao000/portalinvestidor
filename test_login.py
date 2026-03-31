#!/usr/bin/env python3
"""
Script para debugar problemas de login e verificação de senha.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'backend'))

from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash, verify_password

def test_login():
    db = SessionLocal()
    try:
        # Procura o admin
        admin = db.query(User).filter(User.email == 'admin@academiaevoque.com.br').first()
        
        if not admin:
            print("❌ Admin não encontrado no banco de dados!")
            return
        
        print(f"✅ Admin encontrado: {admin.nome}")
        print(f"Email: {admin.email}")
        print(f"Hash salvo no BD: {admin.password_hash}")
        print()
        
        # Testa a verificação
        test_password = "12345678"
        is_valid = verify_password(test_password, admin.password_hash)
        
        print(f"Testando senha: '{test_password}'")
        print(f"Resultado da verificação: {is_valid}")
        print()
        
        if not is_valid:
            print("❌ A senha NÃO corresponde ao hash!")
            print()
            print("Solução: Vamos recriar o hash com a senha correta...")
            
            # Cria um novo hash
            new_hash = get_password_hash(test_password)
            print(f"Novo hash gerado: {new_hash}")
            
            # Atualiza no banco
            admin.password_hash = new_hash
            db.commit()
            db.refresh(admin)
            
            print()
            print("✅ Hash atualizado no banco de dados!")
            print()
            
            # Testa novamente
            is_valid_again = verify_password(test_password, admin.password_hash)
            print(f"Teste novamente: {is_valid_again}")
            
            if is_valid_again:
                print("✅ Sucesso! Agora você consegue fazer login!")
            else:
                print("❌ Ainda não funciona. Problema mais grave com bcrypt.")
        else:
            print("✅ A senha está correta!")
    
    except Exception as e:
        print(f"❌ Erro: {e}")
    finally:
        db.close()

if __name__ == '__main__':
    test_login()
