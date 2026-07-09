setcpm(100)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: n("9 12!2 ~ 9").lpf(1500).gain(.4)

$: n("~ 3 ~ 5 ~ 8 ~ 7 ~ 6 ~ 8 9*2 8 ~ 7 8*2 6 ~ 3").clip(.95).release(.2).gain(.4).lpf(1500).gain(.4)
