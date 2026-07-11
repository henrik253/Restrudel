setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("cajon*4").gain(.3)

$: note("c4 ~ e4 a4 ~ e4 ~ ~").s("gm_electric_bass_finger")
  .lpf(1200).release(.2).gain(.45)

$: note("<a4 c5 e5 c5>").s("Sitar")
  .lpf(3000).release(.4).room(.4).delay(.3).gain(.35)

$: note("<a1 a1 e2 c2>").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
