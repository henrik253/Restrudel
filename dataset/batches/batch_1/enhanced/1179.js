setcpm(104/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("~ hh ~ hh").gain(.18).pan(.4)

$: note("f4 ~ c4 ~ e4 a4 ~ e4 ~ ~ a3 ~").s("gm_lead_6_voice").lpf(2500).release(.3).room(.4).delay(.3).gain(.4)

$: note("c2*8").s("sawtooth").lpf(600).release(.15).gain(.5)

$: note("<f4 a4 c5 e5>").s("square").lpf(2103).room(.5).release(.4).gain(.3)
