setcpm(96/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: n("1 ~ 6 -1@3 ~ ~").scale("g4:minor").transpose(-12).s("sawtooth").lpf(1000).gain(.4)

$: s("sawtooth sine").lpf(300).room(1).pan(.4).slow(2).gain(.3)
