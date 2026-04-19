#!/usr/bin/env bash
set -euo pipefail

get_ip() {
  local ip
  ip="$(ipconfig getifaddr en0 2>/dev/null || true)"
  if [ -n "$ip" ]; then
    printf '%s\n' "$ip"
    return 0
  fi

  ip="$(ipconfig getifaddr en1 2>/dev/null || true)"
  if [ -n "$ip" ]; then
    printf '%s\n' "$ip"
    return 0
  fi

  return 1
}

IP="$(get_ip || true)"
if [ -z "$IP" ]; then
  echo "❌ Не удалось определить локальный IP (en0/en1). Запусти: npx expo start --host lan --clear"
  exit 1
fi

echo "✅ Используем локальный IP: $IP"
export REACT_NATIVE_PACKAGER_HOSTNAME="$IP"
exec npx expo start --host lan --clear
