setcpm(120/4)

$: n("0 -7 ~ 2 0@3 ~ 3 ~ 1 ~ 2 3 -4 -3 4 3 4 0 7 6 4 5 6 4 5 3 4 2").scale("G4 minor").s("sawtooth")

$: s("bd!2 bd*4 bd!4 ~").clip(.4).gain(.3)

$: s("supersaw sd").lpf(2500).gain(.5).release(.1)
