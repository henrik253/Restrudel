setcpm(110/4)

$: note("e2 ~ e2 g2 ~ e2 ~ [d2 e2]").s("gm_electric_bass_finger").release(.2).gain(.5)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.8)

$: s("~ ~ anvil ~").slow(2).gain(.3).room(.6)

$: n("<7 ~ 9 7>").scale("e:minor").s("square").lpf(1600).delay(.4).release(.15).gain(.25)

$: s("hh*8").gain(.16)
