setcpm(130/4)

$: s("pulse gm_pizzicato_strings:4").bank("tr909").gain("<0.5 0.6 0.7 0.8>").clip(2).lpf(557).hpf(176).room(.3).delay(.5)

$: n("2 1 5 8 7").scale("c:minor").s("sawtooth").gain(.35)
