if [ ! -e rsa_private.pem ]; then
    openssl genrsa -out rsa_private.pem 2048
fi
if [ ! -e rsa_public.pem ]; then
    openssl rsa -in rsa_private.pem -pubout -out rsa_public.pem
fi
if [ ! -e roots.pem ]; then
    curl -sSL https://pki.goog/roots.pem -o roots.pem
fi
