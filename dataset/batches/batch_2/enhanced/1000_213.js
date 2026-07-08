setcpm(100/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.8)

$: s("cr ~").slow(2).gain(.3)

$: s("~ sd").note("c3 e3").gain(.4)

$: n("-2 7 4 0 7").scale("d:minor:pentatonic").transpose(-12).s("sawtooth").lpf(900).gain(.4)
