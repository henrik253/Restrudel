setcpm(124/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ clave ~ clave").bank("AkaiLinn").lpf(1585).gain(.37)

$: s("hh*8").gain(.18)

$: n("0 3 7 5 3 0").scale("g:minor").s("supersaw")
  .lpf(2500).release(.25).room(.3).gain(.37)

$: n("<g1 d2 eb2 f1>").scale("g:minor").s("sawtooth")
  .lpf(650).release(.25).gain(.5)
