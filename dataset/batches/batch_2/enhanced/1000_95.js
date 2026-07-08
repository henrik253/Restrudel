setcpm(118/4)
$: s("rd:3*4").hpf(500).lpf(1929).room(.5).gain("[.5 .35]*4")
$: s("cajon ~ tambourine ~").hpf(500).room(.5).gain(.5)
$: n("7 ~ 7 ~").scale("c:minor").gain(.28).decay(.1).sustain(0).degradeBy(.25).s("gm_overdriven_guitar").lpf(1929)
