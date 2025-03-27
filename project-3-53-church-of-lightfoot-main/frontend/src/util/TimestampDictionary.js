export const TimeDictionary = () => {
  var timeDictionary = {};
  if (process.env.NODE_ENV === "production") {
    timeDictionary["18"] = "6pm";
    timeDictionary["19"] = "7pm";
    timeDictionary["20"] = "8pm";
    timeDictionary["21"] = "9pm";
    timeDictionary["22"] = "10pm";
    timeDictionary["23"] = "11pm";
    timeDictionary["00"] = "12am";
    timeDictionary["01"] = "1am";
    timeDictionary["02"] = "2am";
    timeDictionary["03"] = "3am";
    timeDictionary["04"] = "4am";
    timeDictionary["05"] = "5am";
    timeDictionary["06"] = "6am";
    timeDictionary["07"] = "7am";
    timeDictionary["08"] = "8am";
    timeDictionary["09"] = "9am";
    timeDictionary["10"] = "10am";
    timeDictionary["11"] = "11am";
    timeDictionary["12"] = "12pm";
    timeDictionary["13"] = "1pm";
    timeDictionary["14"] = "2pm";
    timeDictionary["15"] = "3pm";
    timeDictionary["16"] = "4pm";
    timeDictionary["17"] = "5pm";
  } else {
    timeDictionary["00"] = "6pm";
    timeDictionary["01"] = "7pm";
    timeDictionary["02"] = "8pm";
    timeDictionary["03"] = "9pm";
    timeDictionary["04"] = "10pm";
    timeDictionary["05"] = "11pm";
    timeDictionary["06"] = "12am";
    timeDictionary["07"] = "1am";
    timeDictionary["08"] = "2am";
    timeDictionary["09"] = "3am";
    timeDictionary["10"] = "4am";
    timeDictionary["11"] = "5am";
    timeDictionary["12"] = "6am";
    timeDictionary["13"] = "7am";
    timeDictionary["14"] = "8am";
    timeDictionary["15"] = "9am";
    timeDictionary["16"] = "10am";
    timeDictionary["17"] = "11am";
    timeDictionary["18"] = "12pm";
    timeDictionary["19"] = "1pm";
    timeDictionary["20"] = "2pm";
    timeDictionary["21"] = "3pm";
    timeDictionary["22"] = "4pm";
    timeDictionary["23"] = "5pm";
  }

  return timeDictionary;
};
