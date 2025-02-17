FROM python:alpine3.21 AS app-build
LABEL maintainer=ibyokun@hotmail.com

RUN pip install --upgrade pip
RUN pip install --upgrade setuptools wheel

WORKDIR /app

COPY requirements.txt .

# Mount the ssh for use with pip install
RUN --mount=type=ssh pip install --prefer-binary --no-cache-dir --upgrade -r requirements.txt

COPY . .

FROM app-build

WORKDIR /app

COPY --from=app-build /app /app

EXPOSE 8000

CMD ["uvicorn", "main:app", "--reload", "--host", "0.0.0.0"]