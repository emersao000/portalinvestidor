#!/usr/bin/env python3
"""
Script para criar um usuário administrador no banco de dados.
Uso: python create_admin.py
"""

import os
import sys
from pathlib import Path

# Adiciona o diretório backend ao path
sys.path.insert(0, str(Path(__file__).parent / 'backend'))

from app.db.session import SessionLocal
from app.db.init_db import init_db
from app.models.user import User
from app.core.security import get_password_hash
from app.utils.validators import normalize_cpf


def create_admin():
    """Cria um usuário administrador interativamente."""
    # Inicializa o banco de dados (cria tabelas se não existirem)
    print("Inicializando banco de dados...")
    try:
        init_db()
    except Exception as e:
        print(f"❌ Erro ao inicializar banco de dados: {e}")
        return False

    print("\n" + "=" * 50)
    print("CRIAR USUÁRIO ADMINISTRADOR")
    print("=" * 50 + "\n")

    # Coleta informações do usuário
    nome = input("Nome completo do admin: ").strip()
    if not nome:
        print("❌ Nome não pode ser vazio!")
        return False

    email = input("Email do admin: ").strip().lower()
    if not email or "@" not in email:
        print("❌ Email inválido!")
        return False

    cpf = input("CPF do admin (opcional, pressione Enter para pular): ").strip()
    if cpf:
        cpf = normalize_cpf(cpf)
    else:
        cpf = "00000000000"  # CPF padrão se não fornecido

    while True:
        password = input("Senha do admin (mínimo 8 caracteres): ").strip()
        if len(password) < 8:
            print("❌ Senha deve ter no mínimo 8 caracteres!")
            continue

        password_confirm = input("Confirme a senha: ").strip()
        if password != password_confirm:
            print("❌ Senhas não conferem!")
            continue

        break

    # Conecta ao banco de dados
    db = SessionLocal()
    try:
        # Verifica se já existe
        existing = db.query(User).filter(
            (User.email == email) | (User.cpf == cpf and cpf != "00000000000")
        ).first()

        if existing:
            print(f"❌ Usuário com email '{email}' já existe!")
            return False

        # Cria o admin
        admin = User(
            nome=nome,
            cpf=cpf,
            email=email,
            password_hash=get_password_hash(password),
            role='admin',
            is_active=True,
            is_authorized=True,
        )

        db.add(admin)
        db.commit()

        print("\n" + "=" * 50)
        print("✅ ADMIN CRIADO COM SUCESSO!")
        print("=" * 50)
        print(f"Email: {email}")
        print(f"Nome: {nome}")
        print(f"CPF: {cpf}")
        print("=" * 50 + "\n")

        return True

    except Exception as e:
        db.rollback()
        print(f"\n❌ Erro ao criar admin: {e}\n")
        return False
    finally:
        db.close()


if __name__ == "__main__":
    try:
        success = create_admin()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n❌ Operação cancelada pelo usuário.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}\n")
        sys.exit(1)
