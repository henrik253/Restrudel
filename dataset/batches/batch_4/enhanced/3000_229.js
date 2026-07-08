setcpm(100)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("sawtooth square gm_distortion_guitar:3 linn9000_sd").gain(.6).lpf(1500).gain(.4)

$: s("gm_ocarina vocal").slow(2.1802).gain(.5)

$: s("sd hh").slow(2).gain(.2)
