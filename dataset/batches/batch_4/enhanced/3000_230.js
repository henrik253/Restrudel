setcpm(100)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("ellipse gm_overdriven_guitar:3").bank("Linn9000").gain(.3).lpf(1500).gain(.4)

$: s("gm_tuba clave gm_percussive_organ shaker_small:3 gm_bandoneon").gain(.5).lpf(1500).gain(.4)

$: s("perc*3 hh:0").slow(4).gain(.2)
