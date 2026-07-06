setcpm(116/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("rd ~ rd ~").gain(.25)

$: s("cp hh").struct("x(3,8)").lpf(2000).gain(.3)

$: n("0 3 5 7").scale("d:minor").s("sawtooth")
  .lpf(1200).release(.2).gain(.4)
