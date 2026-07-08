setcpm(122/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("rd*4").bank("RolandTR808").gain(.2)

$: s("hh*8").gain("[.2 .12]*4").pan(.4)

$: note("c3 e3 g3 e3").s("gm_electric_bass_pick")
  .lpf(1200).release(.2).gain(.45)

$: note("<c2 c2 g1 a1>").s("gm_acoustic_bass")
  .lpf(700).release(.25).gain(.5)
