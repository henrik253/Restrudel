setcpm(100)

$: n("4 4 5 4 3 2 0 0 -3").scale("c4:minor").lpf(1500).gain(.4)

$: s("bd 0 1 2 4 8 6 sd").delay(.5).gain(.8).release(.1421).bank("RolandTR909")

$: s("kick*4 gm_vibraphone:3").bank("RolandTR808").gain(.8)
