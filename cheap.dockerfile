FROM ubuntu:22.04

RUN echo "yoyoyoy, hows your flow?"

COPY cheap.txt cheap.txt

RUN touch cheap.txt && echo "RUN post cheap sleep"
RUN date
RUN sleep 5
RUN date

COPY cheap2.txt cheap2.txt

RUN touch cheap2.txt && echo "RUNnn post cheap2"