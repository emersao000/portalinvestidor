#!/usr/bin/env python3
"""
Script para testar o login via API, simulando exatamente o que o frontend faz.
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api/v1"

def test_api_login():
    print("=" * 60)
    print("TESTE DE LOGIN VIA API")
    print("=" * 60)
    print()
    
    # Dados de teste
    email = "admin@academiaevoque.com.br"
    password = "12345678"
    
    print(f"Testando com:")
    print(f"  Email: {email}")
    print(f"  Senha: {password}")
    print(f"  Comprimento da senha: {len(password)}")
    print()
    
    # Tenta fazer login
    try:
        print("🔄 Enviando requisição POST para /api/v1/auth/login...")
        response = requests.post(
            f"{API_URL}/auth/login",
            json={"email": email, "password": password},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print()
        
        if response.status_code == 200:
            data = response.json()
            print("✅ LOGIN SUCESSFULL!")
            print(json.dumps(data, indent=2, ensure_ascii=False))
        else:
            print(f"❌ Erro na requisição!")
            print(f"Resposta: {response.text}")
            
            if response.status_code == 401:
                print()
                print("⚠️  Credenciais inválidas")
                print("Possíveis causas:")
                print("1. Email ou senha incorretos")
                print("2. Usuário não existe no banco de dados")
            elif response.status_code == 429:
                print()
                print("⚠️  Muitas tentativas! Rate limit ativado.")
                print("Aguarde 60 segundos antes de tentar novamente.")
            elif response.status_code == 422:
                print()
                print("⚠️  Dados inválidos")
                print("Verifique se o email e senha têm o formato correto")
            else:
                print()
                print(f"⚠️  Erro inesperado: {response.status_code}")
                
    except requests.exceptions.ConnectionError:
        print("❌ Erro de conexão!")
        print(f"Não consegui conectar em {API_URL}")
        print()
        print("Verifique:")
        print("1. Se o backend está rodando: npm run dev")
        print("2. Se está na porta correta: http://localhost:8000")
        sys.exit(1)
    except requests.exceptions.Timeout:
        print("❌ Timeout na requisição!")
        print("O backend está muito lento para responder.")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        sys.exit(1)

if __name__ == '__main__':
    test_api_login()
