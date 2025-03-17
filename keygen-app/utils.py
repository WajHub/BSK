from hashlib import sha256
from Crypto.Cipher import AES
from Crypto.Hash import SHA256
from Crypto.Util.Padding import pad,unpad
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa


def generate_rsa_keys():
    # Generate a private key
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=4096
    )

    # Serialize the private key
    pem_private_key = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )

    # Serialize the public key
    pem_public_key = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )

    return pem_private_key, pem_public_key

def encrypt_private_key(private_key, pin):

    aes_key = SHA256.new(pin.encode()).digest()
    cipher = AES.new(aes_key, AES.MODE_ECB)
    
    padded_private_key = pad(private_key, AES.block_size)
    
    ct_bytes = cipher.encrypt(padded_private_key)
    
    return ct_bytes



