setcpm(120/4)

$: s("linndrum_oh gm_trombone:4")

$: note("g4 a3 c4 e4").clip(.9152).release(.1).gain(.5).room(.6402).s("sawtooth")

$: n("2 11 9 10 8 13 12 9 ~ 6 -1@3 ~ ~ 3 4 2 3 1 2 0 1 ~ 6 -1@3 ~ ~ 3 4").lpf(3200).hpf(8000).gain(.4).room(.5426).delay(.4544).degradeBy(.3).s("sawtooth")

$: s("bd*4 sd!2").gain(.7)
