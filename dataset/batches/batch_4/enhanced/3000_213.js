setcpm(100)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("hh 3 5 4").lpf(495).room(.9512).delay(.5).gain(.3)

$: s("bass gm_cello").slow(2).gain(.5)

$: s("pad ballwhistle:1 gm_epiano1:1").slow(2).gain(.5)

$: s("gm_piccolo snare_rim:0 gong 8").lpf(2000).gain(.5)
