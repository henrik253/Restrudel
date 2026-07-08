setcpm(90/4)
$: s("bd ~ bd ~").slow(2).gain(.8)
$: s("pulse ~ pulse ~").slow(3.4771).gain(.3).lpf(1500)
$: s("gm_electric_guitar_clean:2").n("<0 3 5>").lpf(2500).hpf(200).gain(.4)
