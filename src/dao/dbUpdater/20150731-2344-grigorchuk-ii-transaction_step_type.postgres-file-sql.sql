INSERT INTO "transaction_step_type" (code) VALUES

-- Холдирование средств на карте с вводом реквизитов
('preauth'), ('preauthStatus'),

-- Холдирование средств на привязаной карте
('makeRebillPreauth'), ('makeRebillPreauthStatus'),

-- Переводит заHOLDированные средства с карты плательщика
('capture'), ('captureStatus'),

-- Перевод денег на счет получателя
('wireTransfer'), ('wireTransferStatus'),

-- Привязывает карты по удачному запросу HOLDирования средств
('regCard'),

-- Отменяет непереведенный HOLD средств на карте
('return'), ('returnStatus')
;