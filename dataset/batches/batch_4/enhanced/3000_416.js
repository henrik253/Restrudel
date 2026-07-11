setcpm(120/4)

$: s("perc*3 4").slow(2)

$: note("e1 ~").decay(.05).sustain(0).degradeBy(.3).s("sawtooth")

$: n("6 9!3 6 9 11*2 11!2 10 12 12 13 ~ 9 ~ 12 9 12").s("sawtooth")
