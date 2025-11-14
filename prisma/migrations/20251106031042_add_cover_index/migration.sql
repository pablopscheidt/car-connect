-- Garante 1 capa por veículo
CREATE UNIQUE INDEX IF NOT EXISTS vehicle_image_unique_cover
ON "VehicleImage"("vehicleId")
WHERE "isCover" = true;
