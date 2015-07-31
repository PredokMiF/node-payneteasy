CREATE TABLE "transaction"
(
   "uuid" uuid NOT NULL,
   "data" text NOT NULL,
   "created" timestamp without time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (uuid)
)
;