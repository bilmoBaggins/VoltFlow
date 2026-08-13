import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const users = [
  { id: "drv-01", name: "John Smith", email: "john.smith@voltflow.test" },
  { id: "drv-02", name: "Sarah Johnson", email: "sarah.johnson@voltflow.test" },
  { id: "drv-03", name: "Michael Brown", email: "michael.brown@voltflow.test" },
  { id: "drv-04", name: "Emily Davis", email: "emily.davis@voltflow.test" },
  { id: "drv-05", name: "James Wilson", email: "james.wilson@voltflow.test" },
];

const vehicles = [
  {
    id: "ev-01",
    name: "Van A",
    batteryPercent: 62,
    chargeRateKw: 0,
    status: "idle",
    temperatureC: 31,
    siteType: "depot",
    batteryCapacityKwh: 60,
    lat: 51.5074,
    lng: -0.1278,
    locationLabel: "London Depot",
    postcode: "SW1A 1AA",
    gridRegion: "C",
  },
  {
    id: "ev-02",
    name: "Van B",
    batteryPercent: 41,
    chargeRateKw: 7.2,
    status: "charging",
    temperatureC: 29,
    siteType: "home",
    batteryCapacityKwh: 60,
    lat: 51.52,
    lng: -0.1,
    locationLabel: "Driver home",
    postcode: "E1 6AN",
    gridRegion: "C",
  },
  {
    id: "ev-03",
    name: "Van C",
    batteryPercent: 22,
    chargeRateKw: 0,
    status: "idle",
    temperatureC: 28,
    siteType: "depot",
    batteryCapacityKwh: 75,
    lat: 53.4808,
    lng: -2.2426,
    locationLabel: "Manchester Depot",
    postcode: "M1 1AE",
    gridRegion: "G",
  },
  {
    id: "ev-04",
    name: "Van D",
    batteryPercent: 88,
    chargeRateKw: 0,
    status: "driving",
    temperatureC: 33,
    siteType: "public",
    batteryCapacityKwh: 60,
    lat: 55.8642,
    lng: -4.2518,
    locationLabel: "Glasgow route",
    postcode: "G1 1XQ",
    gridRegion: "N",
  },
  {
    id: "ev-05",
    name: "Van E",
    batteryPercent: 55,
    chargeRateKw: 0,
    status: "idle",
    temperatureC: 30,
    siteType: "depot",
    batteryCapacityKwh: 60,
    lat: 51.4545,
    lng: -2.5879,
    locationLabel: "Bristol Depot",
    postcode: "BS1 4DJ",
    gridRegion: "L",
  },
];

async function main() {
  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: user,
      create: user,
    });
  }
  console.log(`Seeded ${users.length} users`);

  for (const vehicle of vehicles) {
    await prisma.vehicle.upsert({
      where: { id: vehicle.id },
      update: vehicle,
      create: vehicle,
    });
  }
  console.log(`Seeded ${vehicles.length} vehicles`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
