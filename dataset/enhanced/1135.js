setcpm(96/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("rd*4").gain(.22)

$: note("c6@2 a5 f5@2").s("gm_ocarina").lpf(3000)
  .release(.3).room(.4).gain(.35)

$: note("c2 g1 c2 f1").s("sawtooth").lpf(700)
  .release(.25).gain(.45)
