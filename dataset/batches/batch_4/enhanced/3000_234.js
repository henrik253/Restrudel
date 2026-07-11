setcpm(100)

$: note("a1 f1 c2").lpf(1500).gain(.4)

$: s("gm_epiano1:1 attack").slow(2).gain(.5)

$: s("bd*2 ~").gain("[1 0.7 0.8 0.5]*2").bank("RolandTR909")
