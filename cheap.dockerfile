FROM ubuntu:22.04

RUN echo "yoyoyoy, hows your flow?"

COPY cheap.txt cheap.txt

RUN touch cheap.txt && echo "RUN post cheap"

COPY cheap2.txt cheap2.txt

RUN touch cheap2.txt && echo "RUN post cheap2"