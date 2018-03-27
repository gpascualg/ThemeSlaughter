# Python agent for builtin autograding
# Includes Anaconda Python 3.6 and bootstraps github cloning

FROM alpine:3.6

COPY app/requirements.txt /opt/requirements.txt

RUN apk --update add --no-cache python3 py3-pip && \
	pip3 install --no-cache-dir --upgrade -r /opt/requirements.txt && \
	rm -rf /var/cache/apk/*

EXPOSE 5000
COPY app /opt/service
ENTRYPOINT [ "python3", "/opt/service/wsgi.py" ]
CMD [""]
