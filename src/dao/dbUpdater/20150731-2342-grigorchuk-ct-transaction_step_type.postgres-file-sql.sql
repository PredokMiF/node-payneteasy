CREATE TABLE "transaction_step_type"
(
   "code" character varying(50) NOT NULL,
   "created" timestamp without time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (code)
)
;