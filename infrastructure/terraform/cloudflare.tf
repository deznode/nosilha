# ------------------------------------------------------------------------------
# Cloudflare — DNS Zone, R2 Storage, and DNS Records for nosilha.com
# ------------------------------------------------------------------------------
#
# This file manages Cloudflare resources that were originally created via the
# Cloudflare dashboard. Resources were imported into Terraform state using
# `cf-terraforming` and `terraform import`.
#
# R2 Custom Domain (media.nosilha.com → nosilha-media) is managed in the
# Cloudflare dashboard. The provider v5 does not support importing R2 custom
# domain resources.

# --- Zone Data Source ---
# Reads the existing zone — does NOT own its lifecycle.
# Prevents accidental zone deletion via Terraform.

data "cloudflare_zone" "nosilha" {
  zone_id = var.cloudflare_zone_id
}

# --- R2 Bucket ---

resource "cloudflare_r2_bucket" "media" {
  account_id = var.cloudflare_account_id
  name       = "nosilha-media"
}

# --- DNS Records ---
# All records are imported from the existing Cloudflare zone.
# After import, `terraform plan` should show no changes.

# Apex A records (4x) — Google Cloud Run domain mapping
resource "cloudflare_dns_record" "apex_a_1" {
  zone_id = var.cloudflare_zone_id
  name    = "nosilha.com"
  type    = "A"
  content = "216.239.38.21"
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "apex_a_2" {
  zone_id = var.cloudflare_zone_id
  name    = "nosilha.com"
  type    = "A"
  content = "216.239.36.21"
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "apex_a_3" {
  zone_id = var.cloudflare_zone_id
  name    = "nosilha.com"
  type    = "A"
  content = "216.239.34.21"
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "apex_a_4" {
  zone_id = var.cloudflare_zone_id
  name    = "nosilha.com"
  type    = "A"
  content = "216.239.32.21"
  proxied = true
  ttl     = 1
}

# Apex AAAA records (4x) — Google Cloud Run domain mapping (IPv6)
resource "cloudflare_dns_record" "apex_aaaa_1" {
  zone_id = var.cloudflare_zone_id
  name    = "nosilha.com"
  type    = "AAAA"
  content = "2001:4860:4802:38::15"
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "apex_aaaa_2" {
  zone_id = var.cloudflare_zone_id
  name    = "nosilha.com"
  type    = "AAAA"
  content = "2001:4860:4802:36::15"
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "apex_aaaa_3" {
  zone_id = var.cloudflare_zone_id
  name    = "nosilha.com"
  type    = "AAAA"
  content = "2001:4860:4802:34::15"
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "apex_aaaa_4" {
  zone_id = var.cloudflare_zone_id
  name    = "nosilha.com"
  type    = "AAAA"
  content = "2001:4860:4802:32::15"
  proxied = true
  ttl     = 1
}

# CNAME records — subdomains
resource "cloudflare_dns_record" "api_cname" {
  zone_id = var.cloudflare_zone_id
  name    = "api.nosilha.com"
  type    = "CNAME"
  content = "ghs.googlehosted.com"
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "domainconnect_cname" {
  zone_id = var.cloudflare_zone_id
  name    = "_domainconnect.nosilha.com"
  type    = "CNAME"
  content = "_domainconnect.gd.domaincontrol.com"
  proxied = false
  ttl     = 3600
}

resource "cloudflare_dns_record" "www_cname" {
  zone_id = var.cloudflare_zone_id
  name    = "www.nosilha.com"
  type    = "CNAME"
  content = "ghs.googlehosted.com"
  proxied = true
  ttl     = 1
}

# NS records — legacy nameserver delegation
resource "cloudflare_dns_record" "apex_ns_1" {
  zone_id = var.cloudflare_zone_id
  name    = "nosilha.com"
  type    = "NS"
  content = "ns08.domaincontrol.com"
  proxied = false
  ttl     = 1
}

resource "cloudflare_dns_record" "apex_ns_2" {
  zone_id = var.cloudflare_zone_id
  name    = "nosilha.com"
  type    = "NS"
  content = "ns07.domaincontrol.com"
  proxied = false
  ttl     = 1
}

# TXT records — verification and email authentication

# Google Search Console verification
resource "cloudflare_dns_record" "apex_txt_google_verification" {
  zone_id = var.cloudflare_zone_id
  name    = "nosilha.com"
  type    = "TXT"
  content = "\"google-site-verification=pGpuNDtoeHIl8cBk5FgqLFlwCSf0-Mw6cH1dn2jZgf0\""
  proxied = false
  ttl     = 1
}

# Resend (sending domain for Supabase auth email) is not managed here. Its
# records were created through Resend's Cloudflare setup on 2026-09-30:
#   TXT   resend._domainkey -> DKIM public key
#   CNAME send              -> send.forge.rmta.net
#   CNAME rsend             -> rsend.forge.rmta.net
# Do not add MX or TXT records on send.nosilha.com: they conflict with the
# CNAME and fail Resend's verification.

# Drop the DKIM record from state without deleting it in Cloudflare.
removed {
  from = cloudflare_dns_record.resend_dkim_txt

  lifecycle {
    destroy = false
  }
}
