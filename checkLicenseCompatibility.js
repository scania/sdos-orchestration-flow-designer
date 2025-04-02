const licenseChecker = require("license-checker");

const allowedLicenses = [
  "MIT",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "Apache-2.0",
  "ISC",
  "CC0-1.0",
  "Unlicense",
  "0BSD",
  "Python-2.0",
  "BlueOak-1.0.0",
  "CC-BY-4.0",
  "CC-BY-3.0",
  "WTFPL",
  "(AFL-2.1 OR BSD-3-Clause)",
  "(WTFPL OR MIT)",
  "(MIT AND CC-BY-3.0)",
  "(MIT OR CC0-1.0)",
  "MIT*",
  "LGPL-3.0-or-later",
];

licenseChecker.init({ start: ".", json: true }, (err, packages) => {
  if (err) {
    console.error("Error:", err);
    process.exit(1);
  } else {
    const incompatibleLicenses = Object.entries(packages)
      .filter(
        ([packageName, packageInfo]) =>
          !allowedLicenses.includes(packageInfo.licenses)
      )
      .map(([packageName, packageInfo]) => ({
        package: packageName,
        license: packageInfo.licenses,
      }));

    if (incompatibleLicenses.length > 0) {
      console.error("Incompatible licenses found:");
      incompatibleLicenses.forEach(({ package: pkg, license }) => {
        console.error(`Package: ${pkg}, License: ${license}`);
      });
      process.exit(1);
    } else {
      console.log("All licenses are compatible with AGPL-3.0");
    }
  }
});
