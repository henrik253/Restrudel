setcpm(112/4)

$: s("bd ~ ht ~ ~ ht sd ~").bank("RolandTR808").gain(.8)

$: s("~ sleighbells ~ sleighbells").gain(.2).pan(.6)

$: n("<0 3 5 7>").scale("d:minor").s("gm_overdriven_guitar")
  .lpf(1800).room(.3).release(.2).gain(.35)

$: n("<d2 d2 bb1 c2>").scale("d:minor").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
