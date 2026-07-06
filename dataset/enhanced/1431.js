setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ sleighbells ~ sleighbells").gain(.25).room(.4)

$: note("g#4 a#4 f#4 ~ g#4 a#4").sound("supersaw").lpf(2000)
  .attack(.01).clip(.95).release(.2).room(.3).gain(.4)

$: note("<g#1 g#1 d#1 f#1>").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
