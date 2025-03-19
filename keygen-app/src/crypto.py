## @file crypto.py
# @brief Moduł odpowiedzialny za operacje kryptograficzne
# @author Adam Jakubowski 193352
# @date 18.03.2025

from hashlib import sha256
import base64
from Crypto.Cipher import AES
from Crypto.Hash import SHA256
from Crypto.Util.Padding import pad,unpad
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa


def generate_private_key(pin):
    """!
    @brief Generuje prywatny klucz 4096-bitowy RSA
    @param 4-cyfrowy pin podany przez użytkownika
    @return 
    @note Klucz prywatny jest nieszyfrowany – wymaga późniejszego szyfrowania AES
    """
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=4096
    )

    with open('./keys/public.pem', 'wb') as f:
        public_key = private_key.public_key().public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        f.write(public_key)

    return private_key

def serialize_private_key(private_key):
    """!
    @brief Serializuje klucz prywatny do formatu PEM
    @param private_key Klucz prywatny
    """
    with open('./keys/private.pem', 'wb') as f:
        private_key = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )
    f.write(private_key).encode('utf-8')


def encrypt_private_key(private_key, pin):

    """!
    @brief Szyfruje klucz prywatny za pomocą AES-256 (PIN jako klucz)
    @param pem_private_key Klucz prywatny w formacie PEM
    @param pin 4-cyfrowy PIN użytkownika
    @return Klucz prywatny zaszyfrowany w formacie Base64
    """

    aes_key = SHA256.new(pin.encode()).digest()
    cipher = AES.new(aes_key, AES.MODE_ECB)
    
    padded_private_key = pad(private_key, AES.block_size)
    
    ct_bytes = cipher.encrypt(padded_private_key)
    ct_base64 = base64.b64encode(ct_bytes).decode('utf-8')

    return ct_base64




