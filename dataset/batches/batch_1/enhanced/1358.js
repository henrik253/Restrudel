setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("rd ~ rd ~ rd ~ rd rd").gain(.2)

$: s("gm_overdriven_guitar:6 ~").slow(2).lpf(1600).room(.4).gain(.5)

$: n("0 ~ 3 5").scale("e:minor").s("sawtooth").lpf(600).release(.2).gain(.4)

$: n("7 5 3 0").scale("e:minor").s("square").lpf(1500).release(.2).room(.3).gain(.35)
