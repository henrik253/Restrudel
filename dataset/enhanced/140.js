setcpm(116/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*8").gain("[.2 .13]*4").pan(.5)

$: note("d4 ~ ~ c4 ~ e4 a4 ~ e4 ~ ~ a3").s("sawtooth")
  .lpf(2200).resonance(6).release(.2).delay(.3).room(.4).gain(.4)

$: note("d2 g2 bb2 d2").s("square").lpf(600).release(.2).gain(.5)

$: note("d4 f4 a4 f4").s("gm_harmonica").clip(.8).room(.5).gain(.3)
