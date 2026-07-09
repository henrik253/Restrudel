setcpm(80)

$: s("bd*2 ~ sd hh*4").slow(4).gain(.5)
$: s("gm_overdriven_guitar:6 cp:12 gm_choir_aahs:3 kick").hpf(7104).gain(0.55).transpose("<0 0 1 0>/8").n("0 1 2 3")
