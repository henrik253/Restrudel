setcpm(120/4)

$: s("gm_electric_guitar_clean:2 hh:8").bank("RolandTR707").hpf(7086)

$: s("vocal 1").gain(.5)

$: s("bd*2 ~").lpf(2000).gain(.4957).transpose("<0@7 1 0 1 0 1>/16")
