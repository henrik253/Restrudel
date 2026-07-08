setcpm(100)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: note("a3 c#4").sound("square cp").lpf(3500).gain(.4)

$: n("3 1 5 4 3").lpf(1500).gain(.4)

$: s("gm_piano gm_choir_aahs:6").slow(8).gain(.5)
