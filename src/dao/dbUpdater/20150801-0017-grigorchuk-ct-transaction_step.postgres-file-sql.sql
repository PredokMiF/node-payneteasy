CREATE TABLE "transaction_step"
(
   "id" serial NOT NULL,
   "transaction_uuid" uuid NOT NULL,
   "req_type" character varying(100) NOT NULL,
   "serial_number" character varying(100) NOT NULL,
   "pne_id" character varying(100),
   "req" text NOT NULL,
   "err" text,
   "res" text,
   "created" timestamp without time zone NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("transaction_uuid") REFERENCES "transaction" (uuid) ON UPDATE RESTRICT ON DELETE RESTRICT,
    FOREIGN KEY ("req_type") REFERENCES "transaction_step_type" (code) ON UPDATE RESTRICT ON DELETE RESTRICT
)
;